; installer_hooks.nsh - Huiyu MD
; Registers Huiyu MD as the default handler for .md and .txt files

!macro NSIS_HOOK_PREINSTALL
  ; Remove stale UserChoice keys so new registration takes effect
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.md\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.txt\UserChoice"
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; Register application in Windows RegisteredApplications (required for default app)
  WriteRegStr HKCU "Software\RegisteredApplications" "${PRODUCTNAME}" "Software\Clients\${PRODUCTNAME}\Capabilities"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities" "ApplicationName" "${PRODUCTNAME}"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities" "ApplicationIcon" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities" "ApplicationDescription" "Markdown and Text File Viewer"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".md" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".mdx" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".markdown" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".mdown" "HuiyuMD.md"
  WriteRegStr HKCU "Software\Clients\${PRODUCTNAME}\Capabilities\FileAssociations" ".txt" "HuiyuMD.txt"

  ; Register ProgID for .txt files (required for default association on Win10/11)
  WriteRegStr HKCU "Software\Classes\HuiyuMD.txt" "" "Text File"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.txt\DefaultIcon" "" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.txt\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'

  ; Register ProgID for .md files
  WriteRegStr HKCU "Software\Classes\HuiyuMD.md" "" "Markdown File"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.md\DefaultIcon" "" "$INSTDIR\${MAINBINARYNAME}.exe,0"
  WriteRegStr HKCU "Software\Classes\HuiyuMD.md\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'

  ; Add to OpenWithProgids so the app appears in "Open with" menu
  WriteRegStr HKCU "Software\Classes\.md\OpenWithProgids" "HuiyuMD.md" ""
  WriteRegStr HKCU "Software\Classes\.txt\OpenWithProgids" "HuiyuMD.txt" ""

  ; Register "Open with" context menu for ANY file (like Notepad++ has "Edit with Notepad++")
  WriteRegStr HKCU "Software\Classes\*\shell\Open with ${PRODUCTNAME}" "" ""
  WriteRegStr HKCU "Software\Classes\*\shell\Open with ${PRODUCTNAME}" "Icon" "$INSTDIR\${MAINBINARYNAME}.exe"
  WriteRegStr HKCU "Software\Classes\*\shell\Open with ${PRODUCTNAME}\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'

  ; Set as default for .md and .txt using Windows COM API
  ; On Win10/11, SetAppAsDefaultAll (vtable idx 4) is the modern replacement for SetAppAsDefault
  System::Call 'OLE32::CoInitializeEx(i 0, i 0)'
  System::Call 'OLE32::CoCreateInstance(g "{591209C7-767B-42B2-9F16-647EEB5F8AB8}", i 0, i 5, g "{4E530B0A-E611-4C77-A3AC-9031D022281B}", *i .r0)'
  ${If} $0 P<> 0
    ; SetAppAsDefaultAll sets the app as default for ALL its registered extensions at once
    System::Call '$0->4(w "${PRODUCTNAME}")'
    System::Call '$0->2()'
  ${EndIf}
  System::Call 'OLE32::CoUninitialize()'

  ; Notify Windows shell of changes
  System::Call 'SHELL32::SHChangeNotify(i 0x08000000, i 0x1000, i 0, i 0)'
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Remove context menu entry
  DeleteRegKey HKCU "Software\Classes\*\shell\Open with ${PRODUCTNAME}"
  ; Remove app capabilities
  DeleteRegValue HKCU "Software\RegisteredApplications" "${PRODUCTNAME}"
  DeleteRegKey HKCU "Software\Clients\${PRODUCTNAME}"
  ; Remove ProgIDs
  DeleteRegKey HKCU "Software\Classes\HuiyuMD.txt"
  DeleteRegKey HKCU "Software\Classes\HuiyuMD.md"
  ; Remove UserChoice so other defaults can be set
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.md\UserChoice"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.txt\UserChoice"
!macroend