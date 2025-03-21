{pkgs}: {
  deps = [
    pkgs.postgresql
    pkgs.libnsl
    pkgs.openssl
    pkgs.jq
  ];
}
