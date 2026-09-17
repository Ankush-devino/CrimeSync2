// bansal
import 'package:flutter/material.dart';

// bansal

class MuleTransactionGraph extends StatelessWidget {
  const MuleTransactionGraph({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: CustomPaint(
        painter: _GraphNodePainter(),
      ),
    );
  }
}

class _GraphNodePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = const Color(0xFF38BDF8).withOpacity(0.5)
      ..strokeWidth = 2;

    final nodePaint = Paint()..color = const Color(0xFF38BDF8);
    final mulePaint = Paint()..color = Colors.amber;

    final p1 = Offset(size.width * 0.2, size.height * 0.5);
    final p2 = Offset(size.width * 0.5, size.height * 0.25);
    final p3 = Offset(size.width * 0.5, size.height * 0.75);
    final p4 = Offset(size.width * 0.8, size.height * 0.5);

    canvas.drawLine(p1, p2, linePaint);
    canvas.drawLine(p1, p3, linePaint);
    canvas.drawLine(p2, p4, linePaint);
    canvas.drawLine(p3, p4, linePaint);

    canvas.drawCircle(p1, 10, nodePaint);
    canvas.drawCircle(p2, 8, mulePaint);
    canvas.drawCircle(p3, 8, mulePaint);
    canvas.drawCircle(p4, 10, Paint()..color = Colors.redAccent);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
