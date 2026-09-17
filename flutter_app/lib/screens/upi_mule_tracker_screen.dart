// bansal
import 'package:flutter/material.dart';

// bansal

class UpiMuleTrackerScreen extends StatelessWidget {
  const UpiMuleTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('UPI Mule Ring Visualizer', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.download, color: Color(0xFF38BDF8)),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.amber.withOpacity(0.4)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.account_tree, color: Colors.amber, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Active Money Laundering Chain', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                        Text('₹4,50,000 dispersed across 4 hops within 180 seconds', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text('Transaction Layering Flow', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            _buildMuleHopCard('Victim Debit (HDFC Bank)', '₹4,50,000', '10:14:02 IST', 'Primary Inflow', Colors.redAccent, false),
            _buildMuleHopCard('Layer 1: Mule ICICI (99281726)', '₹4,45,000', '10:14:45 IST', 'Siphoned -98.8%', Colors.amber, true),
            _buildMuleHopCard('Layer 2: 4x Canara Bank Split', '₹1,10,000 x4', '10:15:30 IST', 'Micro-Smurfing', Colors.cyanAccent, true),
            _buildMuleHopCard('Layer 3: Crypto Off-Ramp (USDT)', '₹4,30,000 eq', '10:16:50 IST', 'P2P Escrow', Colors.purpleAccent, true),
          ],
        ),
      ),
    );
  }

  static Widget _buildMuleHopCard(String title, String amount, String time, String tag, Color color, bool showArrow) {
    return Column(
      children: [
        if (showArrow)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 4),
            child: Icon(Icons.arrow_downward, color: Color(0xFF64748B), size: 18),
          ),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                  Text(time, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(amount, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
                  Text(tag, style: TextStyle(color: color.withOpacity(0.8), fontSize: 9)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
