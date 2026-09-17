// bansal
import 'package:flutter/material.dart';

// bansal

class CellTowerCdrScreen extends StatelessWidget {
  const CellTowerCdrScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cell Tower Dump Analysis', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _CdrRow(imsi: '404450123456789', tower: 'BOM-CENTRAL-09', latLong: '19.0760, 72.8777', time: '10:14 IST', duration: '240s'),
          _CdrRow(imsi: '404450987654321', tower: 'BOM-CENTRAL-09', latLong: '19.0762, 72.8779', time: '10:14 IST', duration: '180s'),
          _CdrRow(imsi: '404450555666777', tower: 'PUN-SHIVAJI-01', latLong: '18.5204, 73.8567', time: '14:20 IST', duration: '410s'),
        ],
      ),
    );
  }
}

class _CdrRow extends StatelessWidget {
  final String imsi;
  final String tower;
  final String latLong;
  final String time;
  final String duration;

  const _CdrRow({required this.imsi, required this.tower, required this.latLong, required this.time, required this.duration});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('IMSI: $imsi', style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold, fontSize: 11)),
              const SizedBox(height: 2),
              Text('$tower ($latLong)', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(time, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
              Text('Dur: $duration', style: const TextStyle(color: Color(0xFF64748B), fontSize: 10)),
            ],
          ),
        ],
      ),
    );
  }
}
