#!/bin/sh
set -e

echo "Applying database migrations (AppDbContext -> main database)..."
./efbundle-app --connection "$ConnectionStrings__DefaultConnection"

echo "Applying database migrations (RagDbContext -> pgvector database)..."
./efbundle-rag --connection "$ConnectionStrings__RagConnection"

echo "Starting LawBridge.Backend..."
exec dotnet LawBridge.Backend.dll