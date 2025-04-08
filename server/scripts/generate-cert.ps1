# Path to /cert relative to the script's location
$certFolder = Join-Path $PSScriptRoot "..\cert"

# Create the /cert folder if it doesn't exist
if (-Not (Test-Path $certFolder)) {
    New-Item -ItemType Directory -Path $certFolder | Out-Null
}

# Paths for cert and key
$certPath = Join-Path $certFolder "cert.pem"
$keyPath = Join-Path $certFolder "key.pem"

# Path to OpenSSL (update if different)
$openssl = "C:\Program Files\OpenSSL-Win64\bin\openssl.exe"

# Verify OpenSSL exists
if (-Not (Test-Path $openssl)) {
    Write-Error "OpenSSL not found. Make sure it's installed in C:\Program Files\OpenSSL-Win64"
    exit
}

# Generate the certificate and key
& $openssl req -new -x509 -nodes -days 365 `
    -subj "/C=IL/ST=TLV/L=TLV/O=Dev/OU=Local/CN=localhost" `
    -out $certPath `
    -keyout $keyPath

Write-Host "Certificates successfully generated in /cert"
