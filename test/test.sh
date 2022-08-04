# !/bin/bash
for i in {1..2}; do
    echo -en "\n✅ "
    curl --location --request POST 'localhost:3000/images' \
    --header 'Content-Type: image/jpeg' \
    --data-binary "@/$(pwd)/test/image$i.jpeg"
done
echo -e "\n✅ Printing out all images:"
curl --location --request GET 'localhost:3000/images?minLat=0&maxLat=180&minLong=0&maxLong=180'
SEARCH=$(curl -s --location --request GET 'localhost:3000/images?minLat=52&maxLat=62&minLong=1&maxLong=3')
echo -e "\n✅ Searching for images with query 'minLat=52 maxLat=62 minLong=1 maxLong=3'... \n$SEARCH"
ID=$(echo $SEARCH | grep -oE '"id":".{0,16}' | head -n 1 | cut -c7-)
echo "✅ Requesting image with id '$ID'..."
curl -s --output output.jpeg --location --request GET "localhost:3000/images/$ID"
echo "✅ Requesting thumbnail version of image with id '$ID'..."
curl -s --output output-thumbnail.jpeg --location --request GET "localhost:3000/images/$ID?thumbnail"
echo -n "✅ Difference between requested file and the original: "
if [[ ! $(diff output.jpeg test/image1.jpeg) ]]; then
    echo -n "None"
fi
echo -en "\n✅ "
curl --location --request DELETE "localhost:3000/images/$ID"
echo -en "\n✅ "
curl --location --request DELETE 'localhost:3000/images/'