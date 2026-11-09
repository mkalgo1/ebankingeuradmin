# PowerShell script to build the European E-Banking Native Android APK

$apkDir = $PSScriptRoot
Set-Location $apkDir

$androidSdk = "C:\Users\DZ_NEXTECH\AppData\Local\Android\Sdk"
$buildTools = "$androidSdk\build-tools\36.0.0"
$platform = "$androidSdk\platforms\android-37.0"

$aapt2 = "$buildTools\aapt2.exe"
$d8 = "$buildTools\d8.bat"
$zipalign = "$buildTools\zipalign.exe"
$apksigner = "$buildTools\apksigner.bat"
$androidJar = "$platform\android.jar"
$keytool = "C:\Program Files\Java\jdk-26.0.2\bin\keytool.exe"

New-Item -ItemType Directory -Path "$apkDir\gen" -Force | Out-Null
New-Item -ItemType Directory -Path "$apkDir\bin" -Force | Out-Null
New-Item -ItemType Directory -Path "$apkDir\obj" -Force | Out-Null

Write-Host "1. Compiling Android Resources..."
& $aapt2 compile --dir res -o compiled_res.zip
& $aapt2 link -I $androidJar compiled_res.zip --manifest AndroidManifest.xml -o bin\unaligned.apk --java gen

Write-Host "2. Compiling Java Classes..."
& javac --release 8 -cp "$androidJar" -d obj gen\eu\ebanking\europe\*.java src\eu\ebanking\europe\*.java

Write-Host "3. Generating DEX Bytecode..."
$classes = (Get-ChildItem -Path obj\eu\ebanking\europe\*.class).FullName
& $d8 --lib $androidJar --output bin $classes

Write-Host "4. Packaging classes.dex into APK..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open("$apkDir\bin\unaligned.apk", [System.IO.Compression.ZipArchiveMode]::Update)
$existing = $zip.GetEntry("classes.dex")
if ($existing) { $existing.Delete() }
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "$apkDir\bin\classes.dex", "classes.dex")
$zip.Dispose()

Write-Host "5. Aligning APK with zipalign..."
& $zipalign -f -v 4 bin\unaligned.apk bin\aligned.apk | Out-Null

Write-Host "6. Signing APK with apksigner..."
$keystore = "$apkDir\ebanking.keystore"
if (!(Test-Path $keystore)) {
    & $keytool -genkeypair -v -keystore $keystore -alias ebanking -keyalg RSA -keysize 2048 -validity 10000 -storepass "ebanking2026" -keypass "ebanking2026" -dname "CN=European E-Banking, OU=Mobile Financial Division, O=European Banking Authority, L=Frankfurt, C=EU"
}
$finalApk = "$apkDir\..\EBankingEurope.apk"
& $apksigner sign --ks $keystore --ks-pass "pass:ebanking2026" --key-pass "pass:ebanking2026" --ks-key-alias ebanking --out $finalApk bin\aligned.apk

Write-Host "7. Verifying APK..."
& $apksigner verify -v $finalApk

Write-Host "APK Built Successfully at: $finalApk"
