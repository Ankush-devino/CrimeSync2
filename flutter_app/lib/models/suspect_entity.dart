// bansal

// bansal

class SuspectEntity {
  final String id;
  final String fullName;
  final String role;
  final double riskScore;
  final String lastKnownLocation;
  final bool isArrestWarrantIssued;

  SuspectEntity({
    required this.id,
    required this.fullName,
    required this.role,
    required this.riskScore,
    required this.lastKnownLocation,
    this.isArrestWarrantIssued = true,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'fullName': fullName,
    'role': role,
    'riskScore': riskScore,
    'lastKnownLocation': lastKnownLocation,
    'isArrestWarrantIssued': isArrestWarrantIssued,
  };
}
