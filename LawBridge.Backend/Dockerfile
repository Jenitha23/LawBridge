# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy source code
COPY . .

# Publish application
RUN dotnet publish -c Release -o /app/publish --no-restore


# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# ASP.NET Core listens on port 8080
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "LawBridge.Backend.dll"]