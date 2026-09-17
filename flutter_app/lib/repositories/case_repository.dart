// bansal
import '../models/suspect_entity.dart';

// bansal

class CaseRepository {
  Future<Map<String, dynamic>> fetchCaseDossier(String caseId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return {
      'caseId': caseId,
      'title': 'Operation Parcel Trap',
      'priority': 'CRITICAL',
      'syndicate': 'Southeast Asia Cyber Compound 04',
      'suspectCount': 3,
      'totalExtortedInr': 450000.0,
    };
  }
}
