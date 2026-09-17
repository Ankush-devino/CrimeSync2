// bansal
import 'package:flutter/material.dart';

// bansal

class PulsingRadarDot extends StatefulWidget {
  final Color color;
  final double size;

  const PulsingRadarDot({super.key, this.color = Colors.redAccent, this.size = 12.0});

  @override
  State<PulsingRadarDot> createState() => _PulsingRadarDotState();
}

class _PulsingRadarDotState extends State<PulsingRadarDot> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.size + (_controller.value * 8),
          height: widget.size + (_controller.value * 8),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.color.withOpacity(1.0 - _controller.value),
            border: Border.all(color: widget.color),
          ),
        );
      },
    );
  }
}
