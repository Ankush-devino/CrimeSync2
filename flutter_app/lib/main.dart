// bansal
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/case_intelligence_screen.dart';
import 'screens/honeypot_radar_screen.dart';
import 'screens/evidence_custody_scanner.dart';

// bansal

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const CrimeSyncApp());
}

class CrimeSyncApp extends StatelessWidget {
  const CrimeSyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CrimeSync Mobile Intelligence',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0B1120),
        primaryColor: const Color(0xFF38BDF8),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF38BDF8),
          secondary: Color(0xFF818CF8),
          surface: Color(0xFF1E293B),
        ),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F172A),
          elevation: 0,
          centerTitle: false,
        ),
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    CaseIntelligenceScreen(),
    HoneypotRadarScreen(),
    EvidenceCustodyScanner(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        backgroundColor: const Color(0xFF0F172A),
        indicatorColor: const Color(0xFF38BDF8).withOpacity(0.2),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.shield_outlined, color: Colors.slate400),
            selectedIcon: Icon(Icons.shield, color: Color(0xFF38BDF8)),
            label: 'Intelligence',
          ),
          NavigationDestination(
            icon: Icon(Icons.radar_outlined, color: Colors.slate400),
            selectedIcon: Icon(Icons.radar, color: Color(0xFF818CF8)),
            label: 'Threat Radar',
          ),
          NavigationDestination(
            icon: Icon(Icons.qr_code_scanner, color: Colors.slate400),
            selectedIcon: Icon(Icons.qr_code_scanner, color: Color(0xFF34D399)),
            label: 'Custody Scan',
          ),
        ],
      ),
    );
  }
}

extension ColorsExtension on Colors {
  static const Color slate400 = Color(0xFF94A3B8);
}
