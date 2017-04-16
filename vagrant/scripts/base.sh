export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y debconf-utils curl

#Install Node
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential software-properties-common


