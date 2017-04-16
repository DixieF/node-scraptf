Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/trusty64"
  config.vm.box_check_update = true
  # Network
  config.vm.network "private_network", ip: "192.168.56.10"
  config.vm.hostname = "nodescraptf.localdev"

  #Filesystem
  config.vm.synced_folder '.', '/vagrant', disabled: true
  config.vm.synced_folder '.', '/home/vagrant/nodescraptf'

  #VB Specifics
  config.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
      vb.gui = false
      vb.name = "nodescraptf_ads786gfh"
      vb.memory = "1024"
  end

  #Provisioning
  config.vm.provision :shell, path: "vagrant/scripts/base.sh", name: "Configuring Base System"
  config.vm.provision :shell, path: "vagrant/scripts/project.sh", name: "Configuring Project Specifics"
end
