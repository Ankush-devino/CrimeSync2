// bansal
import 'package:flutter/material.dart';

// bansal

class HoneypotRadarScreen extends StatefulWidget {
  const HoneypotRadarScreen({super.key});

  @override
  State<HoneypotRadarScreen> createState() => _HoneypotRadarScreenState();
}

class _HoneypotRadarScreenState extends State<HoneypotRadarScreen> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cyber Deception Radar', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.green.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.greenAccent),
            ),
            child: Row(
              children: [
                Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.greenAccent, shape: BoxShape.circle)),
                const SizedBox(width: 6),
                const Text('4 DECOYS LIVE', style: TextStyle(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Radar Visualizer
            Center(
              child: AnimatedBuilder(
                animation: _pulseController,
                builder: (context, child) {
                  return Container(
                    width: 220,
                    height: 220,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFF0F172A),
                      border: Border.all(
                        color: const Color(0xFF38BDF8).withOpacity(0.3 + _pulseController.value * 0.4),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF38BDF8).withOpacity(0.15 * _pulseController.value),
                          blurRadius: 30,
                          spreadRadius: 10,
                        ),
                      ],
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(width: 150, height: 150, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFF334155)))),
                        Container(width: 80, height: 80, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: const Color(0xFF334155)))),
                        const Icon(Icons.satellite_alt, color: Color(0xFF38BDF8), size: 28),
                        // Threat Dots
                        Positioned(
                          top: 40,
                          right: 50,
                          child: _buildRadarBlip('185.220.101.5', Colors.redAccent),
                        ),
                        Positioned(
                          bottom: 50,
                          left: 45,
                          child: _buildRadarBlip('45.142.214.9', Colors.amberAccent),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            // Decoy Nodes Status
            _buildDecoyStatusCard('NODE-FEDEX-01', 'Fake FedEx Customs Portal', 'PORT 443', '14 Probes Today', Colors.redAccent),
            _buildDecoyStatusCard('NODE-UPI-02', 'Decoy NPCI Escrow API', 'PORT 8443', '8 Probes Today', Colors.amberAccent),
            _buildDecoyStatusCard('NODE-POLICE-03', 'Fake Mumbai Cyber Clearance DB', 'PORT 8080', '21 Probes Today', Colors.purpleAccent),
          ],
        ),
      ),
    );
  }

  static Widget _buildRadarBlip(String ip, Color color) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [BoxShadow(color: color.withOpacity(0.8), blurRadius: 8)],
      ),
    );
  }

  static Widget _buildDecoyStatusCard(String id, String name, String port, String hits, Color accentColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: accentColor.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(Icons.shield_moon, color: accentColor, size: 24),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(id, style: TextStyle(color: accentColor, fontWeight: FontWeight.bold, fontSize: 13)),
                  Text(name, style: const TextStyle(color: Colors.white, fontSize: 11)),
                ],
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(port, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.bold)),
              Text(hits, style: const TextStyle(color: Colors.white70, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}
