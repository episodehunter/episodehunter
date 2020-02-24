import fetch from 'node-fetch';

type Event = {
  userAgent?: string;
  cid?: number;
  category: string;
  action: string;
  type: 'event';
}

type PageViewEvent = {
  userAgent?: string;
  cid?: number;
  url: string;
  title?: string;
  type: 'pageview';
}

export type TrackEvent = Event | PageViewEvent;

export interface Analytics {
  trackEvent(event: TrackEvent): Promise<void>;
}

export function createAnalytics(trackId?: string): Analytics {
  return {
    trackEvent(event): Promise<void> {
      if (!trackId) {
        return Promise.resolve();
      }
      let data: Record<string, string | number> = {
        v: 1,
        tid: trackId,
        cid: event.cid || 555
      };
      if (event.type === 'event') {
        Object.assign(data, {
          t: event.type,
          ec: event.category,
          ea: event.action
        });
      } else if (event.type === 'pageview') {
        Object.assign(data, {
          t: event.type,
          dt: event.title,
          dp: event.url
        });
      }

      const payload = Object.entries(data).reduce((payload, [key, value]) => {
        if (value == null) {
          return payload;
        }
        return payload + '&' + key + '=' + encodeURIComponent(value);
      }, '');

      const headers: Record<string, string> = {};
      if (event.userAgent) {
        headers['User-Agent'] = event.userAgent;
      }

      return fetch('https://www.google-analytics.com/collect', {
        body: payload,
        method: 'POST',
        headers
      }).then(
        () => undefined,
        () => undefined
      );
    }
  };
}
