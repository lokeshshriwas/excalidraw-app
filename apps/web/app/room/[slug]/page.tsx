import axios from "axios";
import { BASE_URL } from "../../config";
import ClientPage from "../../component/ClientPage";

const getRoomId = async (slug: string) => {
  const response = await axios.get(`${BASE_URL}/room/${slug}`);
  if (response.status == 200) {
    return response?.data?.id
  }
  return <div>No chat found</div>
};
const page = async ({ params }: { params: { slug: string } }) => {
  const slug = (await params).slug;
  const roomId = await getRoomId(slug); 
  return <div>
    <ClientPage roomId={roomId}/>
  </div>;
};

export default page;
