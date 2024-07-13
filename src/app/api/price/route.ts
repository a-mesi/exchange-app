import 'dotenv/config';
import { type  NextRequest } from  "next/server";

export  async  function  GET(request:  NextRequest) {
	const  searchParams  =  request.nextUrl.searchParams;
	try {
		const  res  =  await  fetch(
	`https://polygon.api.0x.org/swap/v1/price?${searchParams}`,
		{
			headers: {
				"0x-api-key": "85bd668a-2dec-4610-8c7b-3884f2438cb7"  as  string,
		},
	  }
	);
	const  data  =  await  res.json();
	return  Response.json(data);
	} catch (error) {
	console.log(error);
	}
}