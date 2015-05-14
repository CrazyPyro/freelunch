docker run -t -d \
	-p 80:8080 \
	-p 8080:8080 \
	-e GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID \
	-e GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET \
	-e tempPath=/mnt \
	-v $(pwd)/shared:/mnt \
	crazypyro/freelunch > containerId
