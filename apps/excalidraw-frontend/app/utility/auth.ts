
export async function getSession() {
  try {
    const token = await localStorage.getItem('token');
    return token ? token : null;
  } catch (error) {
    console.log("error occured here : ", error);
  }
    
}