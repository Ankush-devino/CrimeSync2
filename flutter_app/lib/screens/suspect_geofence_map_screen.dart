// bansal
import 'package:flutter/material.dart';

// bansal

class SuspectGeofenceMapScreen extends StatefulWidget {
  const SuspectGeofenceMapScreen({super.key});

  @override
  State<SuspectGeofenceMapScreen> createState() => _SuspectGeofenceMapScreenState();
}

class _SuspectGeofenceMapScreenState extends State<SuspectGeofenceMapScreen> {
  bool _geofenceArmed = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cellular Geo-Tracking & Fence', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          Switch(
            value: _geofenceArmed,
            activeColor: Colors.redAccent,
            onChanged: (val) => setState(() => _geofenceArmed = val),
          ),
        ],
      ),
      body: Column(
        children: [
          // Map Visualizer Canvas Container
          Expanded(
            flex: 5,
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Stack(
                children: [
                  // Simulated GIS Grid
                  CustomPaint(
                    size: Size.infinite,
                    painter: GridMapPainter(),
                  ),
                  // Geo-fence Perimeter Circle
                  Center(
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.red.withOpacity(0.08),
                        border: Border.all(
                          color: _geofenceArmed ? Colors.redAccent : Colors.grey,
                          width: 2,
                          style: BorderStyle.solid,
                        ),
                      ),
                      child: const Center(
                        child: Text(
                          'RESTRICTED AIRPORT PERIMETER',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.redAccent, fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
                  // Suspect Blip
                  Positioned(
                    top: 100,
                    right: 80,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.redAccent,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('Vikram Malhotra (Active SIM)', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(height: 4),
                        const Icon(Icons.location_pin, color: Colors.redAccent, size: 28),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Suspect Tracking Timeline Panel
          Expanded(
            flex: 4,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              child: ListView(
                children: const [
                  Text(
                    'Cell Tower Dump Cross-Match (IMSI: 404450123456789)',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  SizedBox(height: 12),
                  _TowerBreadcrumb(
                    time: '14:22:10 UTC',
                    tower: 'PUN-SHIVAJI-TOWER-01 (Pune)',
                    status: 'BREACH: Geofence triggered near Pune Junction',
                    isAlert: true,
                  ),
                  _TowerBreadcrumb(
                    time: '09:10:45 UTC',
                    tower: 'BOM-NORTH-14 (Andheri West)',
                    status: 'Co-located with Mule Account Holder #2',
                    isAlert: false,
                  ),
                  _TowerBreadcrumb(
                    time: '08:30:12 UTC',
                    tower: 'BOM-CENTRAL-09 (Bandra)',
                    status: 'Incoming call from VoIP Southeast Asia Gateway',
                    isAlert: false,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class GridMapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 1;

    for (double i = 0; i < size.width; i += 30) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    for (double j = 0; j < size.height; j += 30) {
      canvas.drawLine(Offset(0, j), Offset(size.width, j), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _TowerBreadcrumb extends StatelessWidget {
  final String time;
  final String tower;
  final String status;
  final bool isAlert;

  const _TowerBreadcrumb({required this.time, required this.tower, required this.status, required this.isAlert});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isAlert ? Icons.warning_amber : Icons.cell_tower,
            color: isAlert ? Colors.redAccent : const Color(0xFF38BDF8),
            size: 18,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(tower, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    Text(time, style: const TextStyle(color: Color(0xFF64748B), fontSize: 10)),
                  ],
                ),
                Text(status, style: TextStyle(color: isAlert ? Colors.redAccent.shade100 : const Color(0xFF94A3B8), fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
