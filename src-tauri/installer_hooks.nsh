; installer_hooks.nsh - Huiyu MD
; Registers .md file associations and restarts Explorer

!macro NSIS_HOOK_PREINSTALL
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; --- Register ProgIDs for .md ---
  WriteRegStr HKCU "Software\Classes\HuiyuMD.md" "" "Markdown File"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.md\DefaultIcon" "" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.md\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'

  ; --- Set extension defaults ---
  WriteRegStr HKCU "Software\Classes\.md" "" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Classes\.mdx" "" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Classes\.markdown" "" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Classes\.mdown" "" "HuiyuMD.md"

  ; --- Add to OpenWithProgids ---
  WriteRegStr HKCU "Software\Classes\.md\OpenWithProgids" "HuiyuMD.md" ""
  WriteRegStr HKCU "Software\Classes\.mdx\OpenWithProgids" "HuiyuMD.md" ""
  WriteRegStr HKCU "Software\Classes\.markdown\OpenWithProgids" "HuiyuMD.md" ""
  WriteRegStr HKCU "Software\Classes\.mdown\OpenWithProgids" "HuiyuMD.md" ""

  ; --- Also write to HKLM ---
  SetRegView 64
  WriteRegStr HKLM "Software\Classes\HuiyuMD.md" "" "Markdown File"
  WriteRegStr HKLM "Software\Classes\HuiyuMD.md\DefaultIcon" "" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKLM "Software\Classes\HuiyuMD.md\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'
  WriteRegStr HKLM "Software\Classes\.md" "" "HuiyuMD.md"
  WriteRegStr HKLM "Software\Classes\.mdx" "" "HuiyuMD.md"
  WriteRegStr HKLM "Software\Classes\.markdown" "" "HuiyuMD.md"
  WriteRegStr HKLM "Software\Classes\.mdown" "" "HuiyuMD.md"
  WriteRegStr HKLM "Software\Classes\.md\OpenWithProgids" "HuiyuMD.md" ""
  WriteRegStr HKLM "Software\Classes\.mdx\OpenWithProgids" "HuiyuMD.md" ""
  WriteRegStr HKLM "Software\Classes\.markdown\OpenWithProgids" "HuiyuMD.md" ""
  WriteRegStr HKLM "Software\Classes\.mdown\OpenWithProgids" "HuiyuMD.md" ""
  SetRegView 32

  ; --- Delete UserChoice keys ---
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.md\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.mdx\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.markdown\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.mdown\UserChoice"

  ; --- Notify shell ---
  System::Call 'SHELL32::SHChangeNotify(i 0x08000000, i 0x0003, i 0, i 0)'

  ; --- Restart Explorer to apply changes ---
  nsExec::ExecToLog 'taskkill /f /im explorer.exe'
  Sleep 1000
  ExecShell "" "explorer.exe"
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  DeleteRegKey HKCU "Software\Classes\HuiyuMD.md"
  SetRegView 64
  DeleteRegKey HKLM "Software\Classes\HuiyuMD.md"
  SetRegView 32
  DeleteRegValue HKCU "Software\Classes\.md" ""
  DeleteRegValue HKCU "Software\Classes\.mdx" ""
  DeleteRegValue HKCU "Software\Classes\.markdown" ""
  DeleteRegValue HKCU "Software\Classes\.mdown" ""
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.md\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.mdx\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.markdown\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.mdown\UserChoice"
  DeleteRegKey HKCU "Software\Classes\*\shell\Open with ${PRODUCTNAME}"
!macroend