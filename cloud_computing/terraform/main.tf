# ==============================================================================
# 🛡️ CrimeSync Sovereign Cloud Infrastructure — Terraform (IaC) Architecture
# National Police Cloud & Sovereign Defense Infrastructure (MeghRaj / AWS GovCloud)
# ==============================================================================

terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "~> 4.2"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "CrimeSync-National-Intelligence-Grid"
      Environment = var.environment
      Compliance  = "BSA-2023-Section-65B-Cert-In"
      Security    = "Zero-Trust-Air-Gapped"
    }
  }
}

# ------------------------------------------------------------------------------
# 1. 🌐 SOVEREIGN VIRTUAL PRIVATE CLOUD (VPC) & ZERO-TRUST ISOLATION
# ------------------------------------------------------------------------------
resource "aws_vpc" "crimesync_sovereign_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "crimesync-sovereign-vpc-${var.environment}"
  }
}

# Air-gapped Private Evidence Subnets (No direct internet egress)
resource "aws_subnet" "evidence_isolated_subnets" {
  count                   = 3
  vpc_id                  = aws_vpc.crimesync_sovereign_vpc.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index + 4)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name                              = "crimesync-isolated-evidence-subnet-${count.index + 1}"
    "kubernetes.io/role/internal-elb" = "1"
    Tier                              = "Air-Gapped-Evidence-Vault"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# ------------------------------------------------------------------------------
# 2. 🔑 CLOUD KMS HARDWARE SECURITY MODULE (HSM) MASTER ENCRYPTION KEY
# ------------------------------------------------------------------------------
resource "aws_kms_key" "evidence_master_kms_key" {
  description              = "CrimeSync Section 65B BSA Master HSM Key for Evidence Envelope Encryption"
  deletion_window_in_days  = 30
  enable_key_rotation      = true
  key_usage                = "ENCRYPT_DECRYPT"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"

  tags = {
    Name     = "crimesync-evidence-master-kms"
    Standard = "FIPS-140-3-Level-3"
  }
}

resource "aws_kms_alias" "evidence_key_alias" {
  name          = "alias/crimesync-evidence-master-key"
  target_key_id = aws_kms_key.evidence_master_kms_key.key_id
}

# ------------------------------------------------------------------------------
# 3. 🗄️ S3 FORENSIC EVIDENCE OBJECT STORAGE WITH OBJECT LOCK (WORM COMPLIANCE)
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "forensic_evidence_vault" {
  bucket        = "crimesync-national-forensic-vault-${var.environment}"
  force_destroy = false

  object_lock_enabled = true

  tags = {
    Name          = "crimesync-forensic-evidence-vault"
    Admissibility = "Section-65B-BSA-2023"
  }
}

# Enforce Object Lock (Write Once Read Many - 7 Year Statutory Retention)
resource "aws_s3_bucket_object_lock_configuration" "vault_lock" {
  bucket = aws_s3_bucket.forensic_evidence_vault.id

  rule {
    default_retention {
      mode = "COMPLIANCE"
      days = 2555 # 7-Year Statutory Evidence Retention (BNSS 2023)
    }
  }
}

# Server-Side Encryption with Customer-Managed HSM KMS Key (AES-256)
resource "aws_s3_bucket_server_side_encryption_configuration" "vault_encryption" {
  bucket = aws_s3_bucket.forensic_evidence_vault.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.evidence_master_kms_key.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

# ------------------------------------------------------------------------------
# 4. ☸️ MANAGED KUBERNETES CLUSTER (EKS) — GPU & AI AGENT SWARM POOLS
# ------------------------------------------------------------------------------
resource "aws_eks_cluster" "crimesync_k8s_cluster" {
  name     = "crimesync-national-grid-${var.environment}"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.30"

  vpc_config {
    subnet_ids              = aws_subnet.evidence_isolated_subnets[*].id
    endpoint_private_access = true
    endpoint_public_access  = false # Air-gapped GovCloud boundary
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

# Node Group 1: General Microservices & API Gateway
resource "aws_eks_node_group" "core_microservices_nodes" {
  cluster_name    = aws_eks_cluster.crimesync_k8s_cluster.name
  node_group_name = "crimesync-core-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = aws_subnet.evidence_isolated_subnets[*].id

  scaling_config {
    desired_size = 4
    max_size     = 12
    min_size     = 2
  }

  instance_types = ["m6i.2xlarge"]

  tags = {
    Tier = "API-Gateway-Backend"
  }
}

# Node Group 2: NVIDIA GPU Acceleration Pool (Whisper v3, Graph Neural Networks, Vision Transformers)
resource "aws_eks_node_group" "gpu_ai_accelerator_nodes" {
  cluster_name    = aws_eks_cluster.crimesync_k8s_cluster.name
  node_group_name = "crimesync-gpu-ai-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = aws_subnet.evidence_isolated_subnets[*].id

  scaling_config {
    desired_size = 2
    max_size     = 8
    min_size     = 1
  }

  instance_types = ["g5.2xlarge"] # NVIDIA A10G Tensor Core GPU (24GB VRAM)

  labels = {
    "accelerator" = "nvidia-gpu"
    "workload"    = "ai-agent-inference"
  }

  taint {
    key    = "nvidia.com/gpu"
    value  = "present"
    effect = "NO_SCHEDULE"
  }
}

# ------------------------------------------------------------------------------
# 5. ⚡ SERVERLESS EVENT-DRIVEN EVIDENCE PROCESSOR (AWS LAMBDA)
# ------------------------------------------------------------------------------
resource "aws_lambda_function" "evidence_ingest_processor" {
  filename         = "serverless_evidence_processor.zip"
  function_name    = "crimesync-evidence-ingest-lambda-${var.environment}"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "evidence_ingestion_lambda.lambda_handler"
  runtime          = "python3.11"
  memory_size      = 2048
  timeout          = 300

  environment {
    variables = {
      KMS_KEY_ID            = aws_kms_key.evidence_master_kms_key.id
      VAULT_ADDR            = var.vault_address
      NEO4J_URI             = var.neo4j_uri
      DATABASE_URL          = var.postgres_url
      LANGGRAPH_WEBHOOK_URL = "http://crimesync-ai-agent.crimesync-prod.svc.cluster.local:8000/trigger"
    }
  }
}

# ------------------------------------------------------------------------------
# 6. 🛡️ IAM ROLES & ZERO-TRUST POLICIES
# ------------------------------------------------------------------------------
resource "aws_iam_role" "eks_cluster_role" {
  name = "crimesync-eks-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role" "eks_node_role" {
  name = "crimesync-eks-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role" "lambda_execution_role" {
  name = "crimesync-lambda-evidence-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}
