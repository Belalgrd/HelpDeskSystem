FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY src/HelpDesk.Domain/HelpDesk.Domain.csproj src/HelpDesk.Domain/
COPY src/HelpDesk.Application/HelpDesk.Application.csproj src/HelpDesk.Application/
COPY src/HelpDesk.Infrastructure/HelpDesk.Infrastructure.csproj src/HelpDesk.Infrastructure/
COPY src/HelpDesk.API/HelpDesk.API.csproj src/HelpDesk.API/

# Restore
RUN dotnet restore src/HelpDesk.API/HelpDesk.API.csproj

# Copy everything
COPY . .

# Build
RUN dotnet build src/HelpDesk.API/HelpDesk.API.csproj -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish src/HelpDesk.API/HelpDesk.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# Final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create uploads directory
RUN mkdir -p /app/uploads

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "HelpDesk.API.dll"]