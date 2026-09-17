// bansal

// bansal

class OfflineSyncService {
  final List<Map<String, dynamic>> _pendingSyncQueue = [];

  void queueEvidenceItem(Map<String, dynamic> evidenceItem) {
    _pendingSyncQueue.add(evidenceItem);
  }

  Future<int> syncPendingQueue() async {
    // Simulated sync to central police backend
    final count = _pendingSyncQueue.length;
    _pendingSyncQueue.clear();
    return count;
  }

  int get pendingCount => _pendingSyncQueue.length;
}
