use std::process::Command;

fn main() {
    let mut cmd = Command::new("npm");
    cmd.arg("run").arg("build");
    cmd.current_dir(std::fs::canonicalize("../frontend").unwrap());

    let output = cmd.output().expect("Building frontend failed!");
    println!("{output:?}");
}