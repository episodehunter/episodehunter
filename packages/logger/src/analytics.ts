import fetch from 'node-fetch';

export type TrackEvent = {
  category: string;
  action: string;
  label: string;
  value: string;
  type?: 'event' | 'screenview' | 'pageview' | 'transaction' | 'item' | 'social' | 'exception' | 'timing';
  cid?: string
}

export interface Analytics {
  trackEvent(event: TrackEvent): Promise<void>;
}

export function createAnalytics(trackId?: string): Analytics {
  return {
    trackEvent(event): Promise<void> {
      const data = {
        // API Version.
        v: '1',
        // Tracking ID / Property ID.
        tid: trackId,
        // Anonymous Client Identifier. Ideally, this should be a UUID that
        // is associated with particular user, device, or browser instance.
        cid: event.cid,
        // Event hit type.
        t: event.type,
        // Event category.
        ec: event.category,
        // Event action.
        ea: event.action,
        // Event label.
        el: event.label,
        // Event value.
        ev: event.value
      };

      return fetch('http://www.google-analytics.com/collect', {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      }).then(
        () => undefined,
        () => undefined
      );
    }
  };
}
