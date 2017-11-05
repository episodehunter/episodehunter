import * as url from 'url';
import { spy } from 'simple-spy';
import { handelHttpError, getTheTvDbToken, getTvDbShow, getTvDbShowEpisodes } from '../the-tv-db.util';

test('reject when not okay', () => {
  // Arrange
  const res = {
    ok: false
  };

  // Act
  expect(() => handelHttpError(res as any)).toThrow();
});

test('Return response when ok', () => {
  // Arrange
  const res = {
    ok: true
  };

  // Act
  const result = handelHttpError(res as any);

  // Assert
  expect(result).toBe(res);
});

test('Get the tv db token', async () => {
  // Arrange
  const token = 'token';
  const res = {
    ok: true,
    json: () => Promise.resolve({ token })
  };
  const fetch = () => Promise.resolve(res);

  // Act
  const result = await getTheTvDbToken(fetch as any);

  // Assert
  expect(result).toBe(token);
});

test('Get show info from the tv db', async () => {
  // Arrange
  const show = { id: 1 };
  const res = {
    ok: true,
    json: () => Promise.resolve({ data: show })
  };
  const fetch = () => Promise.resolve(res);

  // Act
  const result = await getTvDbShow('token', 1, fetch as any);

  // Assert
  expect(result).toBe(show);
});

describe('getTvDbShowEpisodes', () => {
  test('Get one page of episodes', async () => {
    // Arrange
    const episodes = [
      {
        id: 1
      }
    ];
    const data = {
      data: episodes,
      links: {
        next: null as null | number
      }
    };
    const res = {
      ok: true,
      json: () => Promise.resolve(data)
    };
    const fetch = () => Promise.resolve(res);

    // Act
    const result = await getTvDbShowEpisodes('token', 1, 1, fetch as any);

    // Assert
    expect(result).toBe(episodes);
  });

  test('Return an empty array for 404', async () => {
    // Arrange
    const res = {
      ok: false,
      status: 404
    };
    const fetch = () => Promise.resolve(res);

    // Act
    const result = await getTvDbShowEpisodes('token', 1, 1, fetch as any);

    // Assert
    expect(result).toEqual([]);
  });

  test('Return an empty array if data is not defind', async () => {
    // Arrange
    const res = {
      ok: true,
      json: () => Promise.resolve({})
    };
    const fetch = () => Promise.resolve(res);

    // Act
    const result = await getTvDbShowEpisodes('token', 1, 1, fetch as any);

    // Assert
    expect(result).toEqual([]);
  });

  test('Follow next', async () => {
    // Arrange
    const pages = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1 }],
            links: {
              next: 2
            }
          })
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 2 }],
            links: {
              next: null
            }
          })
      }
    ];

    const fetch = spy((path: string) => {
      const u = url.parse(path, true);
      return Promise.resolve(pages[Number(u.query.page) - 1]);
    });

    // Act
    await getTvDbShowEpisodes('token', 1, 1, fetch as any);

    // Assert
    expect(fetch.callCount).toBe(2);
  });

  test('Append all episodes for all pages', async () => {
    // Arrange
    const pages = [
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1 }],
            links: {
              next: 2
            }
          })
      },
      {
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 2 }],
            links: {
              next: null
            }
          })
      }
    ];

    const fetch = spy((path: string) => {
      const u = url.parse(path, true);
      return Promise.resolve(pages[Number(u.query.page) - 1]);
    });

    // Act
    const result = await getTvDbShowEpisodes('token', 1, 1, fetch as any);

    // Assert
    expect(result.length).toBe(2);
    expect(result).toEqual([
      {
        id: 1
      },
      {
        id: 2
      }
    ]);
  });
});
