const changeElementValue = (id: string, value: string) => {
  if (document.getElementById(id)) {
    document.getElementById(id).innerHTML = value;
  }
}

export default changeElementValue;
