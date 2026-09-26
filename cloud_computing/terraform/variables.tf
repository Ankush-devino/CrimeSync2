# ==============================================================================
# 🛡️ CrimeSync Sovereign Cloud Infrastructure — Terraform Variables
# ==============================================================================

variable "aws_region" {
  type        = string
  description = "AWS Sovereign Region (e.g., ap-south-1 for India National Defense Grid)"
  default     = "ap-south-1"
}

variable "environment" {
  type        = string
  description = "Target deployment environment (prod, staging, dr-hot-standby)"
  default     = "prod"
}

variable "vpc_cidr" {
  type        = string
  description = "Base CIDR block for the Sovereign Zero-Trust VPC"
  default     = "10.100.0.0/16"
}

variable "vault_address" {
  type        = string
  description = "Internal URI of the HashiCorp Vault Cluster"
  default     = "https://vault.internal.police.gov.in:8200"
}

variable "postgres_url" {
  type        = string
  description = "High-availability PostgreSQL Neon cloud connection string with pgvector"
  default     = "postgresql://neondb_owner:secure_pass@ep-crimesync-prod.ap-south-1.aws.neon.tech/neondb?sslmode=require"
}

variable "neo4j_uri" {
  type        = string
  description = "Bolt endpoint for Neo4j AuraDB Enterprise Graph"
  default     = "neo4j+s://crimesync-graph.databases.neo4j.io"
}
