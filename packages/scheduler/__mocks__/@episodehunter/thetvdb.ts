export class TheTvDb {
  fetchLastUpdateShowsList() {
    return [
      {
        id: 1,
        // This is a new update
        lastUpdated: 1000000001
      },
      {
        // This show does not exist
        id: 3,
        lastUpdated: 1000000000
      },
      {
        id: 4,
        // Same as we have
        lastUpdated: 1000000002
      },
      {
        id: 5,
        // This is a new update
        lastUpdated: 1000000003
      }
    ];
  }
}
