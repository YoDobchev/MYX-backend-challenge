# !/bin/bash
for i in {1..2}; do
    echo -en "\n✅ "
    curl --location --request POST 'localhost:3000/images' \
    --header 'Content-Type: image/jpeg' \
    --data-binary "@/$(pwd)/test/image$i.jpeg"
done
echo -e "\nAll images:"
curl --location --request GET 'localhost:3000/images?minLat=0&maxLat=180&minLong=0&maxLong=180'
SEARCH=$(curl -s --location --request GET 'localhost:3000/images?minLat=52&maxLat=62&minLong=1&maxLong=3')
echo -e "\n✅ Searching for minLat=52 maxLat=62 minLong=1 maxLong=3... \n$SEARCH"
ID=$(echo $SEARCH | grep -oE '"id":".{0,16}' | head -n 1 | cut -c7-)
curl -s --output output.jpeg --location --request GET "localhost:3000/images/$ID"
echo -n "✅ Difference between requested file and the original: "
if [[ ! $(diff output.jpeg test/image1.jpeg) ]]; then
    echo -n "None"
fi
echo -en "\n✅ "
curl --location --request DELETE "localhost:3000/images/$ID"