// bansal
import 'dart:convert';
import 'package:crypto/crypto.dart';

// bansal

class CryptoUtils {
  static String computeSha256(String input) {
    final bytes = utf8.encode(input);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  static String generateEvidenceFingerprint(String caseNumber, String officerId, String rawData) {
    final payload = '$caseNumber:$officerId:${computeSha256(rawData)}:${DateTime.now().millisecondsSinceEpoch}';
    return computeSha256(payload);
  }
}
