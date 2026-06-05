; installer_hooks.nsh - Huiyu MD
; Registers Huiyu MD as the default handler for .md and .txt files

!macro NSIS_HOOK_PREINSTALL
  ; Nothing here - UserChoice deletion moved to POSTINSTALL
  ; to avoid Windows recreating it before we register our ProgIDs
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; Step 1: Register application in Windows RegisteredApplications
  WriteRegStr HKCU "Software\RegisteredApplications" "${PRODUCTNAME}" "Software\Clients\${PRODUCTNAME}\Capabilities"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities" "ApplicationName" "${PRODUCTNAME}"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities" "ApplicationIcon" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities" "ApplicationDescription" "Markdown and Text File Viewer"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".md" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".mdx" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".markdown" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".mdown" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".txt" "HuiyuMD.txt"

  ; Step 2: Register ProgID for .txt files
  WriteRegStr HKCU "Software\Classes\HuiyuMD.txt" "" "Text File"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.txt\DefaultIcon" "" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.txt\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'

  ; Step 3: Register ProgID for .md files
  WriteRegStr HKCU "Software\Classes\HuiyuMD.md" "" "Markdown File"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.md\DefaultIcon" "" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.md\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'

  ; Step 4: Set extension default values (CRITICAL)
  WriteRegStr HKCU "Software\Classes\.md" "" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Classes\.txt" "" "HuiyuMD.txt"

  ; Step 5: Add to OpenWithProgids
  WriteRegStr HKCU "Software\Classes\.md\OpenWithProgids" "HuiyuMD.md" ""
  WriteRegStr HKCU "Software\Classes\.txt\OpenWithProgids" "HuiyuMD.txt" ""

  ; Step 6: Register "Open with" context menu
  WriteRegStr HKCU "Software\Classes\*\shell\Open with ${PRODUCTNAME}" "" ""
  WriteRegStr HKCU "Software\Classes\*\shell\Open with ${PRODUCTNAME}" "Icon" "$INSTDIR\${MAINBINARYNAME}.exe"
  WriteRegStr HKCU "Software\Classes\*\shell\Open with ${PRODUCTNAME}\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'

  ; Step 7: Delete stale UserChoice keys AFTER all registrations are in place
  ; This prevents Windows from recreating old associations before our entries exist
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.md\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.txt\UserChoice"

  ; Step 8: Also set via HKLM for system-wide effect
  SetRegView 64
  WriteRegStr HKLM "Software\Classes\HuiyuMD.txt" "" "Text File"
  WriteRegStr HKLM "Software\Classes\HuiyuMD.txt\DefaultIcon" "" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKLM "Software\Classes\HuiyuMD.txt\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'
  WriteRegStr HKLM "Software\Classes\HuiyuMD.md" "" "Markdown File"
  WriteRegStr HKLM "Software\Classes\HuiyuMD.md\DefaultIcon" "" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKLM "Software\Classes\HuiyuMD.md\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'
  WriteRegStr HKLM "Software\Classes\.md" "" "HuiyuMD.md"
  WriteRegStr HKLM "Software\Classes\.txt" "" "HuiyuMD.txt"
  WriteRegStr HKLM "Software\Classes\.md\OpenWithProgids" "HuiyuMD.md" ""
  WriteRegStr HKLM "Software\Classes\.txt\OpenWithProgids" "HuiyuMD.txt" ""
  SetRegView 32

  ; Step 9: Try COM API
  System::Call 'OLE32::CoInitializeEx(i 0, i 0)'
  System::Call 'OLE32::CoCreateInstance(g "{591209C7-767B-42B2-9F16-647EEB5F8AB8}", i 0, i 5, g "{4E530B0A-E611-4C77-A3AC-9031D022281B}", *i .r0)'
  ${If} $0 P<> 0
    System::Call '$0->4(w "${PRODUCTNAME}")'
    System::Call '$0->2()'
  ${EndIf}
  System::Call 'OLE32::CoUninitialize()'

  ; Step 10: Notify Windows shell of changes
  System::Call 'SHELL32::SHChangeNotify(i 0x08000000, i 0x1000, i 0, i 0)'
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Remove context menu entry
  DeleteRegKey HKCU "Software\Classes\*\shell\Open with ${PRODUCTNAME}"
  ; Remove app capabilities
  DeleteRegValue HKCU "Software\RegisteredApplications" "${PRODUCTNAME}"
  DeleteRegKey HKCU "Software\Clients\${PRODUCTNAME}"
  ; Remove ProgIDs (both HKCU and HKLM)
  DeleteRegKey HKCU "Software\Classes\HuiyuMD.txt"
  DeleteRegKey HKCU "Software\Classes\HuiyuMD.md"
  SetRegView 64
  DeleteRegKey HKLM "Software\Classes\HuiyuMD.txt"
  DeleteRegKey HKLM "Software\Classes\HuiyuMD.md"
  SetRegView 32
  ; Restore extension default values
  DeleteRegValue HKCU "Software\Classes\.md" ""
  DeleteRegValue HKCU "Software\Classes\.txt" ""
  ; Remove UserChoice
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.md\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.txt\UserChoice"
!macroend