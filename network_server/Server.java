package network_server;
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.InetAddress;

public class Server{
  public static final int MY_PORT=6111;
  private static final String CORRECT_SERVER ="111";
  private static final String CORRECT_CLIENT ="222";

  private ServerSocket serverSocket;

  public Server(int port,int backlog, InetAddress bindAddr) throws IOException {
		serverSocket = new ServerSocket(port,backlog,bindAddr);
	}

  public void serve() throws IOException {
    System.out.println("server started");
		while (true) {
			// block until a client connects
			Socket socket = serverSocket.accept();
			try {
				handle(socket);
			} catch (IOException e) {
				e.printStackTrace(); // but don't terminate serve()
			} finally {
				socket.close();
			}
		}
	}

  private void handle(Socket socket) throws IOException {
      System.out.println("handle socket");
      BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      PrintWriter out = new PrintWriter(new OutputStreamWriter(socket.getOutputStream()));

      try {
        String input=in.readLine();
        if(input!=null){
          if(input.contains("!")){
            String[] dataset=input.split("!");
            if(dataset[0].equals(CORRECT_CLIENT)){
              //TODO:handle with the data
              System.out.println(dataset[1]);
            }
          }
        }
      }finally {
        System.out.println("Close the connection w/ a client");
  			out.close();
  			in.close();
		  }
  }

  public static void main(String[] args) {

		try {
			Server server = new Server(MY_PORT,1000,InetAddress.getByName("192.168.1.67"));
			server.serve();

		} catch (IOException e) {
      System.out.println("error!");
			e.printStackTrace();
		}
	}

}
