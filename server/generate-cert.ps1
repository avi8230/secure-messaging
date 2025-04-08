$certFolder = "cert"
if (-Not (Test-Path $certFolder)) {
    New-Item -ItemType Directory -Path $certFolder | Out-Null
}

$certPath = Join-Path $certFolder "cert.pem"
$keyPath = Join-Path $certFolder "key.pem"

$openssl = "C:\Program Files\OpenSSL-Win64\bin\openssl.exe"

if (-Not (Test-Path $openssl)) {
    Write-Error "OpenSSL not found. Make sure it's installed in C:\Program Files\OpenSSL-Win64"
    exit
}

& $openssl req -new -x509 -nodes -days 365 `
    -subj "/C=IL/ST=TLV/L=TLV/O=Dev/OU=Local/CN=localhost" `
    -out $certPath `
    -keyout $keyPath

Write-Host "Certificates successfully generated in /cert"
