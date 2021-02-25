from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from .models import Room
from .serializers import RoomSerializer, CreateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response


class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, *args, **kwargs):
        code = request.GET.get(self.lookup_url_kwarg)
        room = get_object_or_404(Room, code=code)
        data = self.serializer_class(room).data
        data['is_host'] = self.request.session.session_key == room.host
        return Response(data, status=status.HTTP_200_OK)


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, *args, **kwargs):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        room = get_object_or_404(Room, code=code)
        self.request.session['room_code'] = code
        return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, *args, **kwargs):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid(raise_exception=True):
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset.first()
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()

            self.request.session['room_code'] = room.code

            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)


class UserInRoom(APIView):
    def get(self, request, *args, **kwargs):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }

        return Response(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, *args, **kwargs):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            Room.objects.filter(host=self.request.session.session_key).delete()

        return Response({'Message': 'Success'})
