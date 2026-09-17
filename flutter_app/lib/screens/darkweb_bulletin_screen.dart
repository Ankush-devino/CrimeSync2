// bansal
import 'package:flutter/material.dart';

// bansal

class DarkwebBulletinScreen extends StatelessWidget {
  const DarkwebBulletinScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Darknet & Telegram Intercepts', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildInterceptItem(
            channel: '@MuleAccountsIndia_Escrow',
            time: '8 mins ago',
            text: 'Fresh ICICI & HDFC corporate accounts available with netbanking + pre-activated SIM. Ready for RTGS/IMPS velocity.',
            risk: 'HIGH RISK',
          ),
          _buildInterceptItem(
            channel: '@CustomsScamKits_2026',
            time: '24 mins ago',
            text: 'Updated Mumbai Police digital arrest overlay script + fake arrest warrant PDF template generator.',
            risk: 'CRITICAL',
          ),
        ],
      ),
    );
  }

  Widget _buildInterceptItem({required String channel, required String time, required String text, required String risk}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(channel, style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 12)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(risk, style: const TextStyle(color: Colors.redAccent, fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(text, style: const TextStyle(color: Colors.white, fontSize: 11)),
          const SizedBox(height: 8),
          Text(time, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10)),
        ],
      ),
    );
  }
}
