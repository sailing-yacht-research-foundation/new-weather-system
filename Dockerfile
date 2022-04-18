FROM node:16-alpine AS builder
WORKDIR /usr/src/app
COPY ["package*.json", "tsconfig.json",  "./"]
RUN npm ci
COPY ./src ./src
RUN npm run build

FROM ubuntu:18.04
RUN apt-get update && \
    apt-get install -y --no-install-recommends apt-utils && \
    apt-get install software-properties-common -y && \
    add-apt-repository ppa:ubuntugis/ppa

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y tzdata
RUN ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime
RUN dpkg-reconfigure --frontend noninteractive tzdata

RUN add-apt-repository "deb http://security.ubuntu.com/ubuntu xenial-security main"
RUN apt update

RUN apt-get update \
    && apt-get install tesseract-ocr -y \
	wget \
	curl \
    gfortran \
    bzip2 \
    gcc \
    bc \
    ca-certificates \
    libhdf5-dev \
    gfortran \
    openmpi-bin \
    libopenmpi-dev \
    valgrind \
	unzip \
    libproj-dev \
    proj-data \
    proj-bin \
	make \
    m4 \
    git \
    cron \
    emacs \
    nano \
    tmux \
	build-essential \
	checkinstall \
	libx11-dev \
	libxext-dev \
	zlib1g-dev \
	libpng-dev \
	libjpeg-dev \
	libfreetype6-dev \
    gdal-bin \
    libeccodes0 \
    libgeos-dev \
    cdo \
    libgdal-dev \
    libxml2 \
	libxml2-dev \
    language-pack-en \
    libz-dev \
    libncurses-dev \
    libbz2-dev \
    liblzma-dev \
    libudunits2-dev \
    libpdal-dev \
    pdal \
    libjasper1 \
    libjasper-dev \
    libpdal-plugin-python \
    && apt-get clean \
    && apt-get autoremove

# NCO
RUN apt-get install -y aptitude
RUN aptitude install nco -y

# CMake
RUN wget https://github.com/Kitware/CMake/releases/download/v3.15.2/cmake-3.15.2.tar.gz \
    && tar -zxvf cmake-3.15.2.tar.gz \
    && cd cmake-3.15.2 \
    && ./bootstrap \
    && make \
    && make install \
    && cd .. \
    && rm cmake-3.15.2.tar.gz \
    && rm -rf cmake-3.15.2

# HDF5 Installation
RUN wget https://www.hdfgroup.org/package/bzip2/?wpdmdl=4300 \
        && mv "index.html?wpdmdl=4300" hdf5-1.10.1.tar.bz2 \
        && tar xf hdf5-1.10.1.tar.bz2 \
        && cd hdf5-1.10.1 \
        && ./configure --prefix=/usr --enable-cxx --with-zlib=/usr/include,/usr/lib/x86_64-linux-gnu \
        && make -j4 \
        && make install \
        && cd .. \
        && rm -rf hdf5-1.10.1 \
        && rm -rf hdf5-1.10.1.tar.bz2

# NetCDF Installation
RUN wget https://github.com/Unidata/netcdf-c/archive/v4.4.1.1.tar.gz \
        && tar xf v4.4.1.1.tar.gz \
        && cd netcdf-c-4.4.1.1 \
        && ./configure --prefix=/usr \
        && make -j4 \
        && make install \
        && cd .. \
        && rm -rf netcdf-c-4.4.1.1 \
        && rm -rf v4.4.1.1.tar.gz

# Install wgrib2
RUN wget http://www.ftp.cpc.ncep.noaa.gov/wd51we/wgrib2/wgrib2.tgz

ENV CC gcc
ENV FC gfortran
ENV USE_NETCDF3 0
ENV USE_NETCDF4 1

RUN tar -xzf wgrib2.tgz \
  && cd grib2 \
  && make

RUN cp grib2/wgrib2/wgrib2 /usr/local/bin \
    && rm -rf grib2 \
    && rm wgrib2.tgz

# wdgrib1
RUN wget ftp://ftp.cpc.ncep.noaa.gov/wd51we/wgrib/wgrib.tar \
    && mkdir wgrib1 \
    && tar -C wgrib1 -xvf wgrib.tar \
    && rm wgrib.tar \
    && cd wgrib1 \
    && make \
    && cp wgrib /usr/bin \
    && cd .. \
    && rm -rf wgrib1 

# Python 3
RUN apt-get update \
  && apt-get install -y python3-pip python3-dev \
  && cd /usr/local/bin \
  && ln -s /usr/bin/python3 python \
  && pip3 --no-cache-dir install --upgrade pip \
  && rm -rf /var/lib/apt/lists/*

# ecCODES
RUN wget https://confluence.ecmwf.int/download/attachments/45757960/eccodes-2.20.0-Source.tar.gz \
    && tar -xzf  eccodes-2.20.0-Source.tar.gz \
    && mkdir buildeccode \
    && cd buildeccode \
    && cmake -DENABLE_ECCODES_THREADS=ON -DENABLE_ECCODS_OMP_THREADS=ON ../eccodes-2.20.0-Source \
    && make \
    && ctest \
    && make install \
    && cd .. \
    && rm -rf buildeccode \
    && rm eccodes-2.20.0-Source.tar.gz \
    && rm -rf eccodes-2.20.0-Source \
    && pip3 install eccodes-python 

# ncdump-json
RUN wget https://github.com/jllodra/ncdump-json/archive/master.zip && \
	unzip master.zip && \
	cd ncdump-json-master && \
	cmake . && \
	make && \
	mv ncdump-json /usr/bin/ && \
    cd ..


# Node
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y build-essential

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production --silent
COPY --from=builder /usr/src/app/build/ build/
EXPOSE 3000
CMD ["npm", "start"]