// bansal
import 'package:flutter/material.dart';

// bansal

class FirGeneratorScreen extends StatefulWidget {
  const FirGeneratorScreen({super.key});

  @override
  State<FirGeneratorScreen> createState() => _FirGeneratorScreenState();
}

class _FirGeneratorScreenState extends State<FirGeneratorScreen> {
  final TextEditingController _factsController = TextEditingController(
    text: 'Victim was intimidated by scammers posing as Mumbai Police claiming a seized FedEx parcel with narcotics. Extorted ₹4.50 Lakh via UPI to mule accounts.',
  );
  bool _isGenerating = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI FIR & Charge Sheet Generator', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Incident Statement / Investigation Summary:', style: TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 8),
            TextField(
              controller: _factsController,
              maxLines: 4,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF334155))),
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
                onPressed: () {
                  setState(() => _isGenerating = true);
                  Future.delayed(const Duration(milliseconds: 900), () => setState(() => _isGenerating = false));
                },
                icon: const Icon(Icons.auto_awesome),
                label: Text(_isGenerating ? 'Synthesizing Legal Statutes...' : 'Auto-Generate BNSS Charge Sheet'),
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF38BDF8).withOpacity(0.3)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('DRAFT CHARGESHEET SUMMARY', style: TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 13)),
                  Divider(color: Color(0xFF334155)),
                  Text('Applicable Sections:', style: TextStyle(color: Colors.white70, fontSize: 11)),
                  SizedBox(height: 4),
                  Text('• Section 318(4) BNS 2023 (Cheating and Dishonestly Inducing Delivery of Property)', style: TextStyle(color: Colors.white, fontSize: 11)),
                  Text('• Section 308(2) BNS 2023 (Extortion by Threat of Criminal Accusation)', style: TextStyle(color: Colors.white, fontSize: 11)),
                  Text('• Section 66D IT Act (Cheating by Personation using Computer Resource)', style: TextStyle(color: Colors.white, fontSize: 11)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
