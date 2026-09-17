// bansal
import 'dart:convert';
import 'package:http/http.dart' as http;

// bansal

class ApiClient {
  final String baseUrl = 'http://localhost:5000/api';
  String? _jwtToken;

  void setAuthToken(String token) {
    _jwtToken = token;
  }

  // bansal
  Future<Map<String, dynamic>> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (_jwtToken != null) 'Authorization': 'Bearer $_jwtToken',
      },
    );
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }
    throw Exception('API Error: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (_jwtToken != null) 'Authorization': 'Bearer $_jwtToken',
      },
      body: jsonEncode(body),
    );
    return jsonDecode(response.body);
  }
}
