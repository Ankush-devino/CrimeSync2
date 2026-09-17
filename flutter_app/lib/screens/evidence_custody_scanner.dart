// bansal
import 'package:flutter/material.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';
import '../services/blockchain_mobile_service.dart';

// bansal

class EvidenceCustodyScanner extends StatefulWidget {
  const EvidenceCustodyScanner({super.key});

  @override
  State<EvidenceCustodyScanner> createState() => _EvidenceCustodyScannerState();
}

class _EvidenceCustodyScannerState extends State<EvidenceCustodyScanner> {
  String _scannedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  bool _isVerifying = false;
  Map<String, dynamic>? _blockchainReceipt;

  final BlockchainMobileService _blockchainService = BlockchainMobileService();

  void _performOnChainVerification() async {
    setState(() => _isVerifying = true);
    final receipt = await _blockchainService.verifyEvidenceReceipt(_scannedHash);
    setState(() {
      _blockchainReceipt = receipt;
      _isVerifying = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Digital Chain of Custody', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Scanner Viewport Mock
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF38BDF8), width: 2),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  const Icon(Icons.qr_code_2, size: 100, color: Color(0xFF334155)),
                  Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      border: Border.all(color: const Color(0xFF34D399), width: 2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  const Positioned(
                    bottom: 12,
                    child: Text(
                      'Align Barcode / QR on Evidence Bag',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            // SHA-256 Hash Display
            const Text('Seized Digital Artifact Hash (SHA-256):', style: TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: SelectableText(
                _scannedHash,
                style: const TextStyle(color: Color(0xFF38BDF8), fontFamily: 'monospace', fontSize: 11),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF38BDF8),
                  foregroundColor: Colors.black87,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _isVerifying ? null : _performOnChainVerification,
                icon: _isVerifying
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.verified, size: 20),
                label: Text(
                  _isVerifying ? 'Verifying Ledger Proof...' : 'Verify on Ethereum / Fabric Ledger',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
            if (_blockchainReceipt != null) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B).withOpacity(0.3),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF34D399)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.check_circle, color: Color(0xFF34D399), size: 20),
                        SizedBox(width: 8),
                        Text('IMMUTABLE CUSTODY VERIFIED', style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                    const Divider(color: Color(0xFF047857)),
                    _buildReceiptRow('Block Number', '#19283412'),
                    _buildReceiptRow('Custodian Badge', 'INSP-RAJESH-BANSAL-088'),
                    _buildReceiptRow('Jurisdiction', 'Section 65B BSA Supreme Court Guidelines'),
                    _buildReceiptRow('Status', 'SEALED FOR COURT SUBMISSION'),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  static Widget _buildReceiptRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
        ],
      ),
    );
  }
}
