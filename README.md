# new-weather-archiver

a new weather data ingestion system.

Basically the way it works is this: each model would have a config file. The config file would define either a list of urls for the model's files, or a way to generate that list based on variables. For instance, it would have a list of urls with PARAM in the url, and then a list of PARAMs and the files would be generated by replacing the params in the files urls. This is similar to the existing archiver.

So when a new config is added, there would be an ingestion script that downloads a sample file for each file int he file set, and conducts some processing on it: it would run command line utilities and extract data that doesnt ever change. Forinstance the parameter, the starttime/end time as offsets from the run time, the geographic boundaries, etc, and save them in the database.

Then, we'd download the files and create torrent files for each file set, for each run time.

If we had one button deploy using terraform and kubernetes, we could get other people to host this system. Since we create torrents, the rest of the world could download the data using our torrents much faster than using the ftp from NOAA or other orgs.

If we wanted to add or remove models, it would be as simple as adding or removing config files.

References:

- https://carltonbale.com/how-to-create-and-seed-a-torrent-download-on-amazon-s3/
