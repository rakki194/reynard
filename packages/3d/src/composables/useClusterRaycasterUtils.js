// Cluster raycaster utility functions
// Extracted from useClusterInteractions for modularity
export async function setupClusterRaycaster(renderer, camera, hullMeshes, setHoveredCluster, onClusterSelect) {
    const THREE = (await import("three")).default;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event) => {
        if (!raycaster || !mouse || !camera || !renderer.domElement)
            return;
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hullMeshes);
        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            if (intersected.userData?.clusterId &&
                typeof intersected.userData.clusterId === "string") {
                setHoveredCluster(intersected.userData.clusterId);
            }
        }
        else {
            setHoveredCluster(null);
        }
    };
    const handleClick = (_event) => {
        if (!raycaster || !mouse || !camera)
            return;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hullMeshes);
        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            if (intersected.userData?.clusterId &&
                typeof intersected.userData.clusterId === "string" &&
                onClusterSelect) {
                onClusterSelect(intersected.userData.clusterId);
            }
        }
    };
    if (!renderer.domElement) {
        throw new Error("Renderer must have a domElement for cluster interactions");
    }
    const canvas = renderer.domElement;
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    return () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("click", handleClick);
    };
}
