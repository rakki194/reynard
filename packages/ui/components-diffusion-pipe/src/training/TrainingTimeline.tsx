/**
 * 🦊 Training Timeline Component
 * 
 * Real-time training progress timeline with milestones and events
 * following Reynard's timeline visualization patterns.
 */

import { Show, createSignal, createEffect, Component, onMount, onCleanup } from 'solid-js';
import { Card } from 'reynard-components-core/primitives';
import { Button } from 'reynard-components-core/primitives';
import { Badge } from 'reynard-components-core/primitives';
import { fluentIconsPackage } from 'reynard-fluent-icons';
import { useTrainingWebSocket } from '../hooks/useTrainingWebSocket';

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'start' | 'epoch' | 'checkpoint' | 'milestone' | 'error' | 'complete';
  title: string;
  description?: string;
  data?: any;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface TrainingTimelineProps {
  trainingId?: string;
  websocketUrl?: string;
  events?: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  compact?: boolean;
  showProgress?: boolean;
  maxEvents?: number;
}

export const TrainingTimeline: Component<TrainingTimelineProps> = props => {
  const [timelineEvents, setTimelineEvents] = createSignal<TimelineEvent[]>(props.events || []);
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);
  const [selectedEvent, setSelectedEvent] = createSignal<TimelineEvent | null>(null);

  // WebSocket integration for real-time timeline updates
  const websocket = props.websocketUrl && props.trainingId ? useTrainingWebSocket({
    url: props.websocketUrl,
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
  }) : null;

  // Handle WebSocket events for real-time timeline updates
  createEffect(() => {
    if (websocket) {
      const events = websocket.events();
      events.forEach(event => {
        if (event.trainingId === props.trainingId) {
          let timelineEvent: TimelineEvent | null = null;

          switch (event.type) {
            case 'progress':
              timelineEvent = {
                id: `progress-${event.timestamp.getTime()}`,
                timestamp: event.timestamp,
                type: 'epoch',
                title: `Epoch ${event.data.epoch || 'N/A'}`,
                description: `Progress: ${event.data.progress || 0}%`,
                data: event.data,
                status: 'completed',
              };
              break;
            case 'status':
              timelineEvent = {
                id: `status-${event.timestamp.getTime()}`,
                timestamp: event.timestamp,
                type: 'milestone',
                title: event.data.status || 'Status Update',
                description: event.data.message,
                data: event.data,
                status: 'completed',
              };
              break;
            case 'error':
              timelineEvent = {
                id: `error-${event.timestamp.getTime()}`,
                timestamp: event.timestamp,
                type: 'error',
                title: 'Error Occurred',
                description: event.data.message || 'Unknown error',
                data: event.data,
                status: 'failed',
              };
              break;
            case 'complete':
              timelineEvent = {
                id: `complete-${event.timestamp.getTime()}`,
                timestamp: event.timestamp,
                type: 'complete',
                title: 'Training Complete',
                description: 'Training has finished successfully',
                data: event.data,
                status: 'completed',
              };
              break;
          }

          if (timelineEvent) {
            setTimelineEvents(prev => {
              const updated = [...prev, timelineEvent!];
              // Limit number of events
              if (props.maxEvents && updated.length > props.maxEvents) {
                return updated.slice(-props.maxEvents);
              }
              return updated;
            });
          }
        }
      });
    }
  });

  // Subscribe to training timeline via WebSocket
  onMount(() => {
    if (websocket && props.trainingId) {
      websocket.subscribe(props.trainingId);
    }
  });

  onCleanup(() => {
    if (websocket && props.trainingId) {
      websocket.unsubscribe(props.trainingId);
    }
  });

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'start':
        return 'default';
      case 'epoch':
        return 'secondary';
      case 'checkpoint':
        return 'outline';
      case 'milestone':
        return 'default';
      case 'error':
        return 'destructive';
      case 'complete':
        return 'default';
      default:
        return 'secondary';
    }
  };

  // Get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'start':
        return fluentIconsPackage.getIcon('play');
      case 'epoch':
        return fluentIconsPackage.getIcon('arrow-right');
      case 'checkpoint':
        return fluentIconsPackage.getIcon('save');
      case 'milestone':
        return fluentIconsPackage.getIcon('flag');
      case 'error':
        return fluentIconsPackage.getIcon('error');
      case 'complete':
        return fluentIconsPackage.getIcon('checkmark-circle');
      default:
        return fluentIconsPackage.getIcon('info');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'active':
        return 'default';
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  // Handle event click
  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    props.onEventClick?.(event);
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const events = timelineEvents();
    if (events.length === 0) return 0;
    
    const completedEvents = events.filter(e => e.status === 'completed').length;
    return Math.round((completedEvents / events.length) * 100);
  };

  return (
    <Card class={`training-timeline ${props.compact ? 'compact' : ''}`}>
      <div class="timeline-header">
        <div class="timeline-title">
          <h3>Training Timeline</h3>
          <div class="status-badges">
            <Show when={websocket && websocket.isConnected()}>
              <Badge variant="secondary">
                <span class="streaming-indicator" />
                Live
              </Badge>
            </Show>
            <Show when={websocket && websocket.isConnecting()}>
              <Badge variant="outline">
                <span class="connecting-indicator" />
                Connecting...
              </Badge>
            </Show>
            <Show when={websocket && websocket.error()}>
              <Badge variant="destructive">
                <span class="error-indicator" />
                Connection Error
              </Badge>
            </Show>
            <Show when={props.showProgress}>
              <Badge variant="outline">
                {getProgressPercentage()}% Complete
              </Badge>
            </Show>
          </div>
        </div>

        <div class="timeline-actions">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? 'chevron-up' : 'chevron-down')?.outerHTML || ''}
            />
          </Button>
        </div>
      </div>

      <Show when={isExpanded()}>
        <div class="timeline-content">
          <Show when={timelineEvents().length === 0}>
            <div class="timeline-empty">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={fluentIconsPackage.getIcon('timeline')?.outerHTML || ''}
              />
              <p>No timeline events yet</p>
              <small>Events will appear here as training progresses</small>
            </div>
          </Show>

          <Show when={timelineEvents().length > 0}>
            <div class="timeline-events">
              {timelineEvents().map((event, index) => (
                <div class={`timeline-event ${event.status}`}>
                  <div class="event-indicator">
                    <div class="event-icon">
                      <div
                        // eslint-disable-next-line solid/no-innerhtml
                        innerHTML={getEventTypeIcon(event.type)?.outerHTML || ''}
                      />
                    </div>
                    <Show when={index < timelineEvents().length - 1}>
                      <div class="event-connector" />
                    </Show>
                  </div>

                  <div class="event-content" onClick={() => handleEventClick(event)}>
                    <div class="event-header">
                      <div class="event-title">
                        <h4>{event.title}</h4>
                        <Badge variant={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      <div class="event-meta">
                        <span class="event-time">{formatTimestamp(event.timestamp)}</span>
                        <Badge variant={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>

                    <Show when={event.description}>
                      <p class="event-description">{event.description}</p>
                    </Show>

                    <Show when={event.data && Object.keys(event.data).length > 0}>
                      <div class="event-data">
                        <details>
                          <summary>Event Data</summary>
                          <pre>{JSON.stringify(event.data, null, 2)}</pre>
                        </details>
                      </div>
                    </Show>
                  </div>
                </div>
              ))}
            </div>
          </Show>
        </div>
      </Show>

      <Show when={selectedEvent()}>
        <div class="timeline-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h3>{selectedEvent()?.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon('dismiss')?.outerHTML || ''}
                />
              </Button>
            </div>
            <div class="modal-body">
              <Show when={selectedEvent()?.description}>
                <p>{selectedEvent()?.description}</p>
              </Show>
              <Show when={selectedEvent()?.data}>
                <pre>{JSON.stringify(selectedEvent()?.data, null, 2)}</pre>
              </Show>
            </div>
          </div>
        </div>
      </Show>
    </Card>
  );
};
