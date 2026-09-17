// bansal
import 'package:flutter/material.dart';

// bansal

class CyberIncidentCard extends StatelessWidget {
  final String title;
  final String description;
  final String severity; // CRITICAL, HIGH, MEDIUM
  final String timestamp;

  const CyberIncidentCard({
    super.key,
    required this.title,
    required this.description,
    required this.severity,
    required this.timestamp,
  });

  @override
  Widget build(BuildContext context) {
    Color badgeColor = severity == 'CRITICAL' ? Colors.redAccent : (severity == 'HIGH' ? Colors.amber : Colors.cyan);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(severity, style: TextStyle(color: badgeColor, fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(description, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
          const SizedBox(height: 6),
          Text(timestamp, style: const TextStyle(color: Color(0xFF64748B), fontSize: 9)),
        ],
      ),
    );
  }
}
