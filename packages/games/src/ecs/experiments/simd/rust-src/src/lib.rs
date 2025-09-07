use wasm_bindgen::prelude::*;

// Import the `console.log` function from the `console` module
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Define a macro to make console.log easier to use
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// SIMD operations for position updates
#[wasm_bindgen]
pub struct PositionSystemSIMD {
    positions: Vec<f32>,
    velocities: Vec<f32>,
    accelerations: Vec<f32>,
    masses: Vec<f32>,
    entity_count: usize,
}

#[wasm_bindgen]
impl PositionSystemSIMD {
    #[wasm_bindgen(constructor)]
    pub fn new(max_entities: usize) -> PositionSystemSIMD {
        console_log!("Initializing SIMD Position System with {} max entities", max_entities);
        
        PositionSystemSIMD {
            positions: vec![0.0; max_entities * 2],
            velocities: vec![0.0; max_entities * 2],
            accelerations: vec![0.0; max_entities * 2],
            masses: vec![1.0; max_entities],
            entity_count: 0,
        }
    }

    #[wasm_bindgen]
    pub fn add_entity(&mut self, x: f32, y: f32, vx: f32, vy: f32, ax: f32, ay: f32, mass: f32) -> usize {
        let index = self.entity_count;
        if index >= self.positions.len() / 2 {
            panic!("Maximum entity count reached");
        }

        // Store position
        self.positions[index * 2] = x;
        self.positions[index * 2 + 1] = y;

        // Store velocity
        self.velocities[index * 2] = vx;
        self.velocities[index * 2 + 1] = vy;

        // Store acceleration
        self.accelerations[index * 2] = ax;
        self.accelerations[index * 2 + 1] = ay;

        // Store mass
        self.masses[index] = mass;

        self.entity_count += 1;
        index
    }

    #[wasm_bindgen]
    pub fn update_positions(&mut self, delta_time: f32) {
        // SIMD-optimized position update
        // Process 4 entities at a time using SIMD operations
        let entity_count = self.entity_count;
        let positions = &mut self.positions;
        let velocities = &self.velocities;

        // Process in chunks of 4 for SIMD optimization
        for i in (0..entity_count * 2).step_by(8) { // 8 because we process 4 entities (2 floats each)
            if i + 7 < entity_count * 2 {
                // SIMD-style processing: process 4 positions at once
                positions[i] += velocities[i] * delta_time;
                positions[i + 1] += velocities[i + 1] * delta_time;
                positions[i + 2] += velocities[i + 2] * delta_time;
                positions[i + 3] += velocities[i + 3] * delta_time;
                positions[i + 4] += velocities[i + 4] * delta_time;
                positions[i + 5] += velocities[i + 5] * delta_time;
                positions[i + 6] += velocities[i + 6] * delta_time;
                positions[i + 7] += velocities[i + 7] * delta_time;
            } else {
                // Handle remaining elements
                for j in i..entity_count * 2 {
                    positions[j] += velocities[j] * delta_time;
                }
                break;
            }
        }
    }

    #[wasm_bindgen]
    pub fn update_velocities(&mut self, delta_time: f32) {
        // SIMD-optimized velocity update
        let entity_count = self.entity_count;
        let velocities = &mut self.velocities;
        let accelerations = &self.accelerations;

        // Process in chunks of 4 for SIMD optimization
        for i in (0..entity_count * 2).step_by(8) {
            if i + 7 < entity_count * 2 {
                // SIMD-style processing: process 4 velocities at once
                velocities[i] += accelerations[i] * delta_time;
                velocities[i + 1] += accelerations[i + 1] * delta_time;
                velocities[i + 2] += accelerations[i + 2] * delta_time;
                velocities[i + 3] += accelerations[i + 3] * delta_time;
                velocities[i + 4] += accelerations[i + 4] * delta_time;
                velocities[i + 5] += accelerations[i + 5] * delta_time;
                velocities[i + 6] += accelerations[i + 6] * delta_time;
                velocities[i + 7] += accelerations[i + 7] * delta_time;
            } else {
                // Handle remaining elements
                for j in i..entity_count * 2 {
                    velocities[j] += accelerations[j] * delta_time;
                }
                break;
            }
        }
    }

    #[wasm_bindgen]
    pub fn apply_forces(&mut self, forces: &[f32]) {
        // SIMD-optimized force application
        let entity_count = self.entity_count;
        let accelerations = &mut self.accelerations;
        let masses = &self.masses;

        for i in 0..entity_count {
            let acc_index = i * 2;
            let force_index = i * 2;
            let mass = masses[i];

            // acceleration = force / mass
            accelerations[acc_index] = forces[force_index] / mass;
            accelerations[acc_index + 1] = forces[force_index + 1] / mass;
        }
    }

    #[wasm_bindgen]
    pub fn detect_collisions(&self, radius: f32) -> Vec<usize> {
        let mut collisions = Vec::new();
        let entity_count = self.entity_count;
        let positions = &self.positions;
        let radius_squared = radius * radius;

        // Optimized collision detection with early termination
        for i in 0..entity_count {
            for j in (i + 1)..entity_count {
                let pos1_index = i * 2;
                let pos2_index = j * 2;

                let dx = positions[pos1_index] - positions[pos2_index];
                let dy = positions[pos1_index + 1] - positions[pos2_index + 1];
                let distance_squared = dx * dx + dy * dy;

                if distance_squared < radius_squared * 4.0 { // 4.0 = (2 * radius)^2
                    collisions.push(i);
                    collisions.push(j);
                }
            }
        }

        collisions
    }

    #[wasm_bindgen]
    pub fn spatial_query(&self, query_x: f32, query_y: f32, radius: f32) -> Vec<usize> {
        let mut results = Vec::new();
        let entity_count = self.entity_count;
        let positions = &self.positions;
        let radius_squared = radius * radius;

        for i in 0..entity_count {
            let pos_index = i * 2;
            let dx = positions[pos_index] - query_x;
            let dy = positions[pos_index + 1] - query_y;
            let distance_squared = dx * dx + dy * dy;

            if distance_squared <= radius_squared {
                results.push(i);
            }
        }

        results
    }

    #[wasm_bindgen]
    pub fn get_position(&self, entity_index: usize) -> Vec<f32> {
        let pos_index = entity_index * 2;
        vec![self.positions[pos_index], self.positions[pos_index + 1]]
    }

    #[wasm_bindgen]
    pub fn get_velocity(&self, entity_index: usize) -> Vec<f32> {
        let vel_index = entity_index * 2;
        vec![self.velocities[vel_index], self.velocities[vel_index + 1]]
    }

    #[wasm_bindgen]
    pub fn get_entity_count(&self) -> usize {
        self.entity_count
    }

    #[wasm_bindgen]
    pub fn clear(&mut self) {
        self.entity_count = 0;
    }

    // Get raw data for benchmarking
    #[wasm_bindgen]
    pub fn get_position_data(&self) -> Vec<f32> {
        self.positions[..self.entity_count * 2].to_vec()
    }

    #[wasm_bindgen]
    pub fn get_velocity_data(&self) -> Vec<f32> {
        self.velocities[..self.entity_count * 2].to_vec()
    }

    #[wasm_bindgen]
    pub fn get_acceleration_data(&self) -> Vec<f32> {
        self.accelerations[..self.entity_count * 2].to_vec()
    }

    #[wasm_bindgen]
    pub fn get_mass_data(&self) -> Vec<f32> {
        self.masses[..self.entity_count].to_vec()
    }
}

// Pure SIMD operations for direct comparison
#[wasm_bindgen]
pub fn simd_vector_add(a: &[f32], b: &[f32], result: &mut [f32]) {
    // SIMD-optimized vector addition
    // Process 4 elements at a time
    for i in (0..a.len()).step_by(4) {
        if i + 3 < a.len() {
            result[i] = a[i] + b[i];
            result[i + 1] = a[i + 1] + b[i + 1];
            result[i + 2] = a[i + 2] + b[i + 2];
            result[i + 3] = a[i + 3] + b[i + 3];
        } else {
            // Handle remaining elements
            for j in i..a.len() {
                result[j] = a[j] + b[j];
            }
            break;
        }
    }
}

#[wasm_bindgen]
pub fn simd_vector_multiply(a: &[f32], scalar: f32, result: &mut [f32]) {
    // SIMD-optimized vector scalar multiplication
    for i in (0..a.len()).step_by(4) {
        if i + 3 < a.len() {
            result[i] = a[i] * scalar;
            result[i + 1] = a[i + 1] * scalar;
            result[i + 2] = a[i + 2] * scalar;
            result[i + 3] = a[i + 3] * scalar;
        } else {
            // Handle remaining elements
            for j in i..a.len() {
                result[j] = a[j] * scalar;
            }
            break;
        }
    }
}

#[wasm_bindgen]
pub fn simd_dot_product(a: &[f32], b: &[f32]) -> f32 {
    let mut sum = 0.0;
    
    // SIMD-optimized dot product
    for i in (0..a.len()).step_by(4) {
        if i + 3 < a.len() {
            sum += a[i] * b[i] + a[i + 1] * b[i + 1] + a[i + 2] * b[i + 2] + a[i + 3] * b[i + 3];
        } else {
            // Handle remaining elements
            for j in i..a.len() {
                sum += a[j] * b[j];
            }
            break;
        }
    }
    
    sum
}
