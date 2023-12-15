import { Message } from "primereact/message";

const Home = () => {
  const content = (
    <div style={{display:'flex',justifyItems:'center',alignItems:'center'}}>
      <img alt="logo" src="/unimed.png" width="32" />
      <div style={{margin:'0.5rem 2rem',fontWeight:'600'}}> Bienvenido al sistema UNIMED beta v0.1</div>
    </div>
  );

  return (
    <div style={{display:'flex',justifyContent:'center'}}>
      <Message
        style={{
          border: 'solid #696cff',
          borderWidth: '0 0 0 6px',
          color: '#696cff',
          marginTop:'4rem',
          width:'100%'
        }}
        severity="info"
        content={content}
      />
    </div>
  )
}

export default Home