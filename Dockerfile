FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY LawBridge.Backend/*.csproj ./LawBridge.Backend/
RUN dotnet restore ./LawBridge.Backend/LawBridge.Backend.csproj

COPY LawBridge.Backend/ ./LawBridge.Backend/
WORKDIR /src/LawBridge.Backend
RUN dotnet publish -c Release -o /app/publish --no-restore

# ---- EF Core migrations bundles (one per DbContext / database) ----
# AppDbContext  -> main database (users, chats, categories, documents, etc.)
# RagDbContext  -> pgvector database (LegalChunks + embeddings)
RUN dotnet tool install --global dotnet-ef --version 8.* \
    && export PATH="$PATH:/root/.dotnet/tools" \
    && dotnet ef migrations bundle \
        --configuration Release \
        --context AppDbContext \
        --self-contained \
        -r linux-x64 \
        -o /app/publish/efbundle-app \
    && dotnet ef migrations bundle \
        --configuration Release \
        --context RagDbContext \
        --self-contained \
        -r linux-x64 \
        -o /app/publish/efbundle-rag

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Tesseract needs its native dependency present in the runtime image.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libleptonica-dev libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# tessdata (eng, sin, tam) ships alongside Program.cs and is read via
# ContentRootPath at runtime — must be copied into the published output.
COPY LawBridge.Backend/tessdata ./tessdata

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh ./efbundle-app ./efbundle-rag

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["./entrypoint.sh"]