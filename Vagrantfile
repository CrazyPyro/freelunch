
Vagrant.configure("2") do |config|
  config.vm.define "app" do |app|
    app.vm.provider "docker" do |d|
      d.build_dir = "."
      d.link "freelunch-db"
    end
  end

  config.vm.define "db" do |app|
    app.vm.provider "docker" do |d|
      d.image = "mongo"
      d.name = "freelunch-db"
    end
  end
end
