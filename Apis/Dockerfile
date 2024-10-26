# Sử dụng image cho .NET SDK (cho việc build)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy file project và restore các dependencies
COPY ["./apis.csproj", "./"]
RUN dotnet restore "./apis.csproj"

# Copy toàn bộ mã nguồn và build project
COPY . .
WORKDIR "/src"
RUN dotnet build "apis.csproj" -c Release -o /app/build

# Publish ứng dụng
RUN dotnet publish "apis.csproj" -c Release -o /app/publish

# Sử dụng image cho .NET runtime (cho việc chạy ứng dụng)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5000

# Chạy ứng dụng
ENTRYPOINT ["dotnet", "apis.dll"]
