// bansal
import 'package:flutter/material.dart';

// bansal

class VoiceCloningAnalyzerScreen extends StatefulWidget {
  const VoiceCloningAnalyzerScreen({super.key});

  @override
  State<VoiceCloningAnalyzerScreen> createState() => _VoiceCloningAnalyzerScreenState();
}

class _VoiceCloningAnalyzerScreenState extends State<VoiceCloningAnalyzerScreen> {
  bool _isPlaying = false;
  double _aiProbability = 0.942;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Voice Deepfake Forensics', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Spectrogram Waveform Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.redAccent.withOpacity(0.4)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('INTERCEPTED_VOIP_CALL_09.wav', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.redAccent.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('AI CLONED SYNTHETIC', style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Mock Audio Waveform
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(24, (index) {
                      final heights = [12.0, 24.0, 45.0, 18.0, 32.0, 50.0, 38.0, 15.0, 28.0, 42.0, 35.0, 20.0, 48.0, 30.0, 16.0, 34.0, 52.0, 25.0, 14.0, 40.0, 22.0, 30.0, 18.0, 8.0];
                      return Container(
                        width: 6,
                        height: heights[index % heights.length],
                        decoration: BoxDecoration(
                          color: index > 14 ? Colors.redAccent : const Color(0xFF38BDF8),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        iconSize: 42,
                        icon: Icon(_isPlaying ? Icons.pause_circle : Icons.play_circle, color: const Color(0xFF38BDF8)),
                        onPressed: () => setState(() => _isPlaying = !_isPlaying),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Acoustic Neural Artifact Breakdown', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 12),
            _buildFeatureProgressRow('Neural Vocoder Phase Inversion', 0.96, Colors.redAccent),
            _buildFeatureProgressRow('Pitch Stability & Jitter Ratio', 0.88, Colors.amberAccent),
            _buildFeatureProgressRow('Formant Frequency Discontinuity', 0.91, Colors.redAccent),
            _buildFeatureProgressRow('Biometric Voiceprint Match', 0.12, Colors.greenAccent),
          ],
        ),
      ),
    );
  }

  static Widget _buildFeatureProgressRow(String label, double value, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
              Text('${(value * 100).toStringAsFixed(1)}%', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: value,
              backgroundColor: const Color(0xFF334155),
              color: color,
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }
}
