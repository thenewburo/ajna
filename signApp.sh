ionic build --release android
jarsigner.exe -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./key.keystore ./platforms/android/build/outputs/apk/android-release-unsigned.apk TheNewBuro_Kroot
zipalign.exe -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk ./TheNewBuro_Kroot.apk